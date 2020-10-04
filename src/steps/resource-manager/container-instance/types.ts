import { Container, Volume } from '@azure/arm-containerinstance/esm/models';

export type ContainerWithId = Container & { id: string };
export type VolumeWithId = Volume & { id: string };
