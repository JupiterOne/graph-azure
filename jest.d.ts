import { Entity, Relationship } from '@jupiterone/integration-sdk-core';

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainOnlyGraphObjects<T extends Entity | Relationship>(
        ...expected: T[]
      ): R;
      toContainGraphObject<T extends Entity | Relationship>(expected: T): R;
    }
  }
}
