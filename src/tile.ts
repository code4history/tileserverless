// NOTE: これは Lambda-proxy のハンドラ

import { errorResponse, getTile } from "./lib";

// @ts-ignore
import MBTiles from "@mapbox/mbtiles";
import path from "path";

export const handler = async (
  event: { pathParameters?: { proxy?: string } },
  context: AWSLambda.Context
) => {
  console.log(event);
  // validate path params
  if (!event.pathParameters || !event.pathParameters.proxy) {
    throw errorResponse(400, "invalid Parameters.");
  }

  const match = event.pathParameters.proxy.match(
    /^(?<z>[0-9]+)\/(?<x>[0-9]+)\/(?<y>[0-9]+)\.mvt$/
  );
  if (!match) {
    console.log(2, match);
    throw errorResponse(400, "invalid Parameters.");
  }
  const { x, y, z } = match.groups as { x: string; y: string; z: string };
  const invalidTileXYZ = [x, y, z].every((val) => {
    const num = parseInt(val, 10);
    return Number.isNaN(num) || num < 0;
  });
  if (invalidTileXYZ) {
    throw errorResponse(400, "invalid Parameters.");
  }

  return await getTile(z, x, y);
};
