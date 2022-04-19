// @ts-nocheck
// https://github.com/dubzzz/fast-check/issues/2781

import { Chain, types }
  from 'https://deno.land/x/clarinet@v0.31.0/index.ts';

export class Principal {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  clarityValue(): string {
    return types.principal(this.value);
  }
}

export class Uint {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  clarityValue(): string {
    return types.uint(this.value);
  }
}

export class Ascii {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  clarityValue(): string {
    return types.ascii(this.value);
  }
}

export type Model = {
  shipments: Map<number, Record<string, string>>
, currentId: number
};

export type Real = {
  chain: Chain
};

export type CargoCommand =
  fc.Command<Model, Real>;
