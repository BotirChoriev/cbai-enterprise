/**
 * Builds an equirectangular globe texture from bundled Natural Earth 110m GeoJSON.
 * Public domain — see NATURAL-EARTH-ATTRIBUTION.md.
 */

import landGeoJson from "./data/ne_110m_land.json";
import coastlineGeoJson from "./data/ne_110m_coastline.json";

type GeoJsonFeatureCollection = {
  features: Array<{
    geometry: {
      type: "Polygon" | "MultiPolygon" | "LineString" | "MultiLineString";
      coordinates: number[][][] | number[][][][] | number[][] | number[][][];
    };
  }>;
};

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;

const OCEAN = "#07101f";
const LAND = "#7399ad";
const LAND_MID = "#85adc0";
const LAND_HIGHLIGHT = "#9ec4d4";
const COAST = "#f0faf8";
const COAST_INLAND = "rgba(196, 232, 224, 0.55)";
const GRATICULE = "rgba(94, 234, 212, 0.14)";

function lngLatToPixel(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * TEXTURE_WIDTH;
  const y = ((90 - lat) / 180) * TEXTURE_HEIGHT;
  return [x, y];
}

function drawPolygonRing(ctx: CanvasRenderingContext2D, ring: number[][]) {
  if (ring.length === 0) return;
  const [startX, startY] = lngLatToPixel(ring[0][0], ring[0][1]);
  ctx.moveTo(startX, startY);
  for (let i = 1; i < ring.length; i += 1) {
    const [x, y] = lngLatToPixel(ring[i][0], ring[i][1]);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawPolygon(ctx: CanvasRenderingContext2D, coordinates: number[][][]) {
  const outer = coordinates[0];
  if (!outer) return;
  ctx.beginPath();
  drawPolygonRing(ctx, outer);
  for (let h = 1; h < coordinates.length; h += 1) {
    drawPolygonRing(ctx, coordinates[h]);
  }
}

function drawLineString(ctx: CanvasRenderingContext2D, coordinates: number[][]) {
  if (coordinates.length === 0) return;
  ctx.beginPath();
  const [startX, startY] = lngLatToPixel(coordinates[0][0], coordinates[0][1]);
  ctx.moveTo(startX, startY);
  for (let i = 1; i < coordinates.length; i += 1) {
    const [x, y] = lngLatToPixel(coordinates[i][0], coordinates[i][1]);
    ctx.lineTo(x, y);
  }
}

function drawGraticule(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = GRATICULE;
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    for (let lng = -180; lng <= 180; lng += 2) {
      const [x, y] = lngLatToPixel(lng, lat);
      if (lng === -180) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let lng = -180; lng < 180; lng += 30) {
    ctx.beginPath();
    for (let lat = -90; lat <= 90; lat += 2) {
      const [x, y] = lngLatToPixel(lng, lat);
      if (lat === -90) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/** Rasterize Natural Earth vectors into a canvas suitable for THREE.CanvasTexture. */
export function buildNaturalEarthGlobeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = OCEAN;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  drawGraticule(ctx);

  const land = landGeoJson as GeoJsonFeatureCollection;
  ctx.fillStyle = LAND;
  for (const feature of land.features) {
    const { geometry } = feature;
    if (geometry.type === "Polygon") {
      drawPolygon(ctx, geometry.coordinates as number[][][]);
      ctx.fill("evenodd");
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates as number[][][][]) {
        drawPolygon(ctx, polygon);
        ctx.fill("evenodd");
      }
    }
  }

  ctx.fillStyle = LAND_MID;
  ctx.globalAlpha = 0.42;
  for (const feature of land.features) {
    const { geometry } = feature;
    if (geometry.type === "Polygon") {
      drawPolygon(ctx, geometry.coordinates as number[][][]);
      ctx.fill("evenodd");
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates as number[][][][]) {
        drawPolygon(ctx, polygon);
        ctx.fill("evenodd");
      }
    }
  }

  ctx.fillStyle = LAND_HIGHLIGHT;
  ctx.globalAlpha = 0.28;
  for (const feature of land.features) {
    const { geometry } = feature;
    if (geometry.type === "Polygon") {
      drawPolygon(ctx, geometry.coordinates as number[][][]);
      ctx.fill("evenodd");
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates as number[][][][]) {
        drawPolygon(ctx, polygon);
        ctx.fill("evenodd");
      }
    }
  }
  ctx.globalAlpha = 1;

  const coast = coastlineGeoJson as GeoJsonFeatureCollection;
  ctx.strokeStyle = COAST;
  ctx.lineWidth = 1.35;
  ctx.globalAlpha = 0.92;
  for (const feature of coast.features) {
    const { geometry } = feature;
    if (geometry.type === "LineString") {
      drawLineString(ctx, geometry.coordinates as number[][]);
      ctx.stroke();
    } else if (geometry.type === "MultiLineString") {
      for (const line of geometry.coordinates as number[][][]) {
        drawLineString(ctx, line);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = COAST_INLAND;
  ctx.lineWidth = 0.75;
  ctx.globalAlpha = 0.9;
  for (const feature of land.features) {
    const { geometry } = feature;
    if (geometry.type === "Polygon") {
      const rings = geometry.coordinates as number[][][];
      for (const ring of rings) {
        drawLineString(ctx, ring);
        ctx.stroke();
      }
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates as number[][][][]) {
        for (const ring of polygon) {
          drawLineString(ctx, ring);
          ctx.stroke();
        }
      }
    }
  }

  return canvas;
}

export const NATURAL_EARTH_ATTRIBUTION =
  "Natural Earth 110m vectors (public domain) — naturalearthdata.com";
