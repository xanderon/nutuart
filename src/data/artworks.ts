export type CollectionSlug =
  | "decorations"
  | "autocolante"
  | "geamuri-sablate"
  | "vitralii"
  | "printuri"
  | "trofee";

export const collectionLabels: Record<CollectionSlug, string> = {
  decorations: "Artă în sticlă",
  autocolante: "Autocolante",
  "geamuri-sablate": "Geamuri sablate",
  vitralii: "Vitralii",
  printuri: "Printuri",
  trofee: "Trofee & obiecte premiu",
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

export const artworks: Artwork[] = [
  {
    id: "autocolante-birou-dinamic",
    title: "Graphica Business Hub",
    medium: "Autocolant printat & decupat",
    year: "2013",
    dimensions: "perete 8 m",
    image: "/images/collections/autocolante/autocolant-birou-01.jpg",
    description:
      "Branding pentru spațiu corporate realizat cu autocolant printat, laminat mat și decupaj pe contur pentru zone vitrate.",
    collection: "autocolante",
  },
  {
    id: "autocolante-sablare-vizual",
    title: "Zonare birouri Creative",
    medium: "Autocolant sablat personalizat",
    year: "2013",
    dimensions: "geamuri pe 2 niveluri",
    image: "/images/collections/autocolante/autocolant-birou-02.jpg",
    description:
      "Pattern geometric sablat cu decupaje negative pentru a delimita spații de lucru fără a pierde luminozitatea.",
    collection: "autocolante",
  },
  {
    id: "autocolant-identitate-birouri",
    title: "Identitate Office",
    medium: "Autocolant printat UV",
    year: "2014",
    dimensions: "fațadă interioară",
    image: "/images/collections/autocolante/autocolant-birouri-03.jpg",
    description:
      "Aplicare de autocolant cu design custom pentru recepție și birouri, cu accent pe culori corporate și mesaj.",
    collection: "autocolante",
  },
  {
    id: "geam-sablat-finesse",
    title: "Spațiul Finesse",
    medium: "Sticlă sablată manual",
    year: "2014",
    dimensions: "panouri 200 × 90 cm",
    image: "/images/collections/geamuri-sablate/geam-sablat-01.jpg",
    description:
      "Model organic sablat pe întreaga suprafață pentru a crea intimitate, păstrând totodată un flux generos de lumină.",
    collection: "geamuri-sablate",
  },
  {
    id: "geam-sablat-simetrie",
    title: "Simetrie Modernă",
    medium: "Sablare cu mască decupată",
    year: "2014",
    dimensions: "uși glisante 220 × 80 cm",
    image: "/images/collections/geamuri-sablate/geam-sablat-02.jpg",
    description:
      "Pattern geometric repetitiv sablat pe uși glisante pentru a crea un efect de vitraj grafic adaptat spațiului contemporan.",
    collection: "geamuri-sablate",
  },
  {
    id: "geam-sablat-sighisoara",
    title: "Sighișoara Heritage",
    medium: "Sticlă sablată & gravată",
    year: "2016",
    dimensions: "ferestre 150 × 60 cm",
    image: "/images/collections/geamuri-sablate/geam-sablat-sighisoara-03.jpg",
    description:
      "Intervenție pentru clădire istorică, cu motive inspirate din arhitectura saxonă redate prin sablare și gravură fină.",
    collection: "geamuri-sablate",
  },
  {
    id: "vitraliu-atelier-aurora",
    title: "Aurora Atelier",
    medium: "Vitraliu stratificat cu patină",
    year: "2018",
    dimensions: "180 × 70 cm",
    image: "/images/collections/vitralii/vitraliu-atelier-01.jpg",
    description:
      "Vitraliu contemporan construit din sticlă texturată și foiță metalică, cu incrustații care distribuie lumina caldă.",
    collection: "vitralii",
  },
  {
    id: "vitraliu-ritmuri",
    title: "Ritmuri de culoare",
    medium: "Vitraliu Tiffany",
    year: "2019",
    dimensions: "120 × 60 cm",
    image: "/images/collections/vitralii/vitraliu-atelier-02.jpg",
    description:
      "Compoziție abstractă realizată în tehnica Tiffany, cu accent pe ritmul liniilor de cupru și contrast cromatic bogat.",
    collection: "vitralii",
  },
  {
    id: "vitralii-horezu",
    title: "Lumina Horezu",
    medium: "Vitraliu restaurat",
    year: "2020",
    dimensions: "ferestre 3 m",
    image: "/images/collections/vitralii/vitralii-horezu-03.jpg",
    description:
      "Restaurare și completare vitralii într-o biserică din Horezu, păstrând simbolistica originală și adăugând detalii contemporane.",
    collection: "vitralii",
  },
  {
    id: "print-outdoor-brand",
    title: "Brand Outdoor",
    medium: "Print UV exterior",
    year: "2013",
    dimensions: "panou 4 × 2 m",
    image: "/images/collections/printuri/print-outdoor-01.jpg",
    description:
      "Print outdoor rezistent UV, montat pe structuri metalice pentru vizibilitate în trafic intens.",
    collection: "printuri",
  },
  {
    id: "print-outdoor-eveniment",
    title: "Campanie eveniment",
    medium: "Mesh publicitar",
    year: "2013",
    dimensions: "banner 5 × 3 m",
    image: "/images/collections/printuri/print-outdoor-02.jpg",
    description:
      "Mesh tensionat pentru promovarea unui eveniment cultural, cu grafică vibrantă și rezistență la intemperii.",
    collection: "printuri",
  },
  {
    id: "print-outdoor-instalare",
    title: "Montaj day-night",
    medium: "Backlit print",
    year: "2013",
    dimensions: "casetă luminoasă",
    image: "/images/collections/printuri/print-outdoor-03.jpg",
    description:
      "Casetă luminoasă cu print backlit pentru vizibilitate nocturnă, instalată într-un spațiu comercial aglomerat.",
    collection: "printuri",
  },
  {
    id: "trofeu-crystalwave",
    title: "Crystal Wave",
    medium: "Sticlă șlefuită & gravură laser",
    year: "2014",
    dimensions: "35 cm înălțime",
    image: "/images/collections/trofee/trofeu-01.jpg",
    description:
      "Trofeu personalizat din sticlă groasă, șlefuită manual și gravată cu laser pentru detalii de finețe.",
    collection: "trofee",
  },
  {
    id: "trofeu-aurora",
    title: "Aurora Trophy",
    medium: "Sticlă colorată + lemn",
    year: "2014",
    dimensions: "30 cm înălțime",
    image: "/images/collections/trofee/trofeu-02.jpg",
    description:
      "Combinație de sticlă colorată și bază din lemn nobil, creată pentru o gală dedicată industriilor creative.",
    collection: "trofee",
  },
  {
    id: "trofeu-arc",
    title: "Arc de lumină",
    medium: "Sticlă sablată & gravură",
    year: "2014",
    dimensions: "32 cm înălțime",
    image: "/images/collections/trofee/trofeu-03.jpg",
    description:
      "Silhuetă arcuită cu sablare dublă și elemente gravate, ideală pentru ceremonii corporate sau culturale.",
    collection: "trofee",
  },
];
