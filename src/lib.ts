// @ts-ignore
import MBTiles from "@mapbox/mbtiles";

const mbtilesPath = (process.env.MOUNT_PATH as string) + "/tiles.mbtiles";

export const errorResponse = (statusCode: number, message: string) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain",
  },
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
