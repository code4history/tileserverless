import { errorResponse, isGzipped } from "./lib";
import zlib from "zlib";
import fs from "fs";
import axios from "axios";

// @ts-ignore
import MBTiles from "@mapbox/mbtiles";
import path from "path";

export const handler = (
  event: AWSLambda.APIGatewayProxyEvent,
  context: AWSLambda.Context,
  callback: AWSLambda.Callback
) => {
  // validate path params
  if (!event.pathParameters || !event.pathParameters.proxy) {
    return callback(null, errorResponse(400, "invalid Parameters."));
  }

  // proxy tiles.json
  // if (event.pathParameters.proxy === "tiles.json") {
  //   return metadataHandler(event, context, callback);
  // }

  const match = event.pathParameters.proxy.match(
    /^(?<z>[0-9]+)\/(?<x>[0-9]+)\/(?<y>[0-9]+)\.mvt$/
  );
  if (!match) {
    return callback(null, errorResponse(400, "invalid Parameters."));
  }
  const { x, y, z } = match.groups as { x: string; y: string; z: string };
  const invalidTileXYZ = [x, y, z].every((val) => {
    const num = parseInt(val, 10);
    return Number.isNaN(num) || num < 0;
  });
  if (invalidTileXYZ) {
    return callback(null, errorResponse(400, "invalid Parameters."));
  }

  return new MBTiles(
    path.resolve(__dirname, "..", "data", "nps.mbtiles"),
    (error: any, mbtiles: any) => {
      if (error) {
        console.error(error);
        return callback(null, errorResponse(500, "Unknown error"));
      } else {
        mbtiles.getTile(z, x, y, (error: any, data: any, headers: any) => {
          if (error) {
            return callback(null, errorResponse(204, "Not found"));
          } else {
            return callback(null, {
              statusCode: 200,
              headers: {
                "Content-Type": "application/vnd.mapbox-vector-tile",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD",
                "Access-Control-Allow-Headers": "Content-Type",
                // "Content-Encoding": "", // API Gateway should encode the body following Accept-Encoding header
                "X-Frame-Options": "SAMEORIGIN",
              },
              body: data.toString(),
            });
          }
        });
      }
    }
  );
};

// @ts-ignore
handler({ pathParameters: { proxy: "1/1/0.mvt" } }, {}, (err, data) => {
  const theStatic = fs.readFileSync(
    "/Users/kamataryo/Desktop/nationalpark-mvt/docs/1/1/0.mvt",
    { encoding: "utf-8" }
  );

  axios
    .get(
      "https://f2mnai0uo6.execute-api.ap-northeast-1.amazonaws.com/dev/tiles/1/1/0.mvt",
      {
        headers: {
          "Accept-Encoding": "gzip",
        },
      }
    )
    .then(({ data, headers }) => {
      console.log("--- equivalency ---");
      console.log(data === theStatic);
      console.log(headers);
    });
});