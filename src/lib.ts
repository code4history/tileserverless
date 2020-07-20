// @ts-ignore
import MBTiles from "@mapbox/mbtiles";
import fs from "fs";

const mbtilesPath = process.env.MOUNT_PATH! + "/tiles.mbtiles";
const testTextPath = process.env.MOUNT_PATH! + "/test.txt";

export const errorResponse = (statusCode: number, message: string) =>
  JSON.stringify({
    statusCode,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: message,
  });

export const getTile = (
  z: number | string,
  x: number | string,
  y: number | string
) => {
  return new Promise<Buffer>((resolve, reject) => {
    return new MBTiles(mbtilesPath, (error: any, mbtiles: any) => {
      if (error) {
        reject(error);
      } else {
        mbtiles.getTile(z, x, y, (error: any, data: any, headers: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      }
    });
  });
};
