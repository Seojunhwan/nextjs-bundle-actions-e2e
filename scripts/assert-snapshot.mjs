import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const EXPECTED_ROUTES = ["/", "/dashboard", "/lazy", "/products/[slug]"];
const DYNAMIC_IMPORT_SENTINEL = "DYNAMIC_IMPORT_E2E_SENTINEL_v1";

function fail(message) {
  throw new Error(message);
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(entryPath) : [entryPath];
    }),
  );
  return nested.flat();
}

const [snapshotPath, expectedBundler, expectedProjectId, buildPath] =
  process.argv.slice(2);

if (!snapshotPath || !expectedBundler || !expectedProjectId) {
  fail(
    "Usage: pnpm test:snapshot <snapshot.json> <webpack|turbopack> <project-id> [build-path]",
  );
}

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const actualRoutes = snapshot.routes
  .map(({ path: routePath }) => routePath)
  .sort();

if (JSON.stringify(actualRoutes) !== JSON.stringify(EXPECTED_ROUTES)) {
  fail(
    `Expected routes ${EXPECTED_ROUTES.join(", ")}; received ${actualRoutes.join(", ")}`,
  );
}
if (snapshot.environment.bundler !== expectedBundler) {
  fail(
    `Expected ${expectedBundler} bundler; received ${snapshot.environment.bundler}`,
  );
}
if (snapshot.identity.projectId !== expectedProjectId) {
  fail(
    `Expected project ${expectedProjectId}; received ${snapshot.identity.projectId}`,
  );
}
if (snapshot.schemaVersion !== 2) {
  fail(`Expected snapshot schema v2; received v${snapshot.schemaVersion}`);
}
if (!snapshot.capabilities.includes("route.deferredAssets.v1")) {
  fail("Snapshot does not advertise route.deferredAssets.v1");
}

for (const route of snapshot.routes) {
  if (route.initialAssets.length === 0) {
    fail(`${route.path} has no initial assets`);
  }
  if (route.routeSpecificRawBytes <= 0) {
    fail(`${route.path} has no route-specific initial JavaScript`);
  }
  if (route.sharedRawBytes <= 0) {
    fail(`${route.path} has no shared initial JavaScript`);
  }
  if (!Array.isArray(route.deferredAssets)) {
    fail(`${route.path} has no deferred asset measurement`);
  }
}

if (buildPath) {
  const chunksRoot = path.join(buildPath, "static", "chunks");
  const chunkPaths = (await filesBelow(chunksRoot)).filter((filePath) =>
    filePath.endsWith(".js"),
  );
  const sentinelChunks = [];

  for (const chunkPath of chunkPaths) {
    if ((await readFile(chunkPath, "utf8")).includes(DYNAMIC_IMPORT_SENTINEL)) {
      sentinelChunks.push(
        path.relative(buildPath, chunkPath).replaceAll(path.sep, "/"),
      );
    }
  }

  if (sentinelChunks.length === 0) {
    fail("The dynamic component was not emitted as a client chunk");
  }

  const initialAssets = new Set(
    snapshot.routes.flatMap((route) => route.initialAssets),
  );
  const eagerSentinelChunk = sentinelChunks.find((chunk) =>
    initialAssets.has(chunk),
  );
  if (eagerSentinelChunk) {
    fail(`Dynamic component chunk is initial JavaScript: ${eagerSentinelChunk}`);
  }

  const lazyRoute = snapshot.routes.find((route) => route.path === "/lazy");
  if (!lazyRoute) {
    fail("The /lazy route is missing");
  }
  const measuredSentinelChunk = sentinelChunks.find((chunk) =>
    lazyRoute.deferredAssets.includes(chunk),
  );
  if (!measuredSentinelChunk) {
    fail("The /lazy route did not measure the dynamic component as deferred");
  }
  if (lazyRoute.deferredRawBytes <= 0 || lazyRoute.deferredGzipBytes <= 0) {
    fail("The /lazy route has no deferred JavaScript size");
  }
  const incorrectlyAssociatedRoute = snapshot.routes.find(
    (route) =>
      route.path !== "/lazy" &&
      sentinelChunks.some((chunk) => route.deferredAssets.includes(chunk)),
  );
  if (incorrectlyAssociatedRoute) {
    fail(
      `Dynamic component was associated with ${incorrectlyAssociatedRoute.path}`,
    );
  }
}

console.log(
  `Verified ${expectedBundler} snapshot with ${actualRoutes.length} routes${
    buildPath ? " and a route-linked deferred dynamic chunk" : ""
  }`,
);
