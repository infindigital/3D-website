/**
 * A product as the 3D world needs it: a name, the owner-supplied artwork
 * and the accent that lights it. Kept apart from the full Product record so
 * the scene never pulls the whole catalogue into the client bundle.
 */
export interface StagePack {
  slug: string;
  name: string;
  /** Public URL of the owner-supplied front artwork */
  front: string;
  /** Back artwork. The front is reused when the back has not been supplied. */
  back?: string;
  accent: string;
}
