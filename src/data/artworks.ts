export type CollectionSlug =
  | "sablate"
  | "biserici"
  | "trofee"
  | "autocolante";

export const collectionDisplayOrder: CollectionSlug[] = [
  "sablate",
  "biserici",
  "trofee",
  "autocolante",
];

export const collectionLabels: Record<CollectionSlug, string> = {
  sablate: "Geamuri sablate",
  biserici: "Biserici",
  trofee: "Trofee",
  autocolante: "Autocolante",
};

export const collectionTitlePrefixes: Record<CollectionSlug, string> = {
  sablate: "Geam sablat",
  biserici: "Biserica",
  trofee: "Trofeu",
  autocolante: "Autocolant",
};

export const collectionMediums: Record<CollectionSlug, string> = {
  sablate: "Sticla sablata",
  biserici: "Lucrare decorativa pentru biserica",
  trofee: "Trofeu din sticla",
  autocolante: "Autocolant aplicat",
};

export type Artwork = {
  id: string;
  title: string;
  medium: string;
  year: string;
  dimensions: string;
  image: string;
  thumbnail?: string;
  description: string;
  collection: CollectionSlug;
};
