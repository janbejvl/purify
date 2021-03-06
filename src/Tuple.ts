export interface TupleTypeRef {
  <F, S>(fst: F, snd: S): Tuple<F, S>
  /** Applies two functions over a single value and constructs a tuple from the results */
  fanout<F, S, T>(f: (value: T) => F, g: (value: T) => S, value: T): Tuple<F, S>
  fanout<F, S, T>(
    f: (value: T) => F,
    g: (value: T) => S
  ): (value: T) => Tuple<F, S>
  fanout<F, T>(
    f: (value: T) => F
  ): <S>(g: (value: T) => S) => (value: T) => Tuple<F, S>
  /** Constructs a tuple from an array with two elements */
  fromArray<F, S>([fst, snd]: [F, S]): Tuple<F, S>
}

export interface Tuple<F, S> extends Iterable<F | S>, ArrayLike<F | S> {
  constructor: typeof Tuple
  0: F
  1: S
  [index: number]: F | S
  length: 2
  toJSON(): [F, S]
  inspect(): string
  toString(): string
  /** Returns the first value of `this` */
  fst(): F
  /** Returns the second value of `this` */
  snd(): S
  /** Compares the values inside `this` and another tuple */
  equals(other: Tuple<F, S>): boolean
  /** Transforms the two values inside `this` with two mapper functions */
  bimap<F2, S2>(f: (fst: F) => F2, g: (snd: S) => S2): Tuple<F2, S2>
  /** Applies a function to the first value of `this` */
  mapFirst<F2>(f: (fst: F) => F2): Tuple<F2, S>
  /** Applies a function to the second value of `this` */
  map<S2>(f: (snd: S) => S2): Tuple<F, S2>
  /** A somewhat arbitraty implementation of Foldable for Tuple, the reducer will be passed the initial value and the second value insinde `this` as arguments */
  reduce<T>(reducer: (accumulator: T, value: S) => T, initialValue: T): T
  /** Returns an array with 2 elements - the values inside `this` */
  toArray(): [F, S]
  /** Swaps the values inside `this` */
  swap(): Tuple<S, F>
  /** Applies the second value of a tuple to the second value of `this` */
  ap<T, S2>(f: Tuple<T, (value: S) => S2>): Tuple<F, S2>

  'fantasy-land/equals'(other: Tuple<F, S>): boolean
  'fantasy-land/bimap'<F2, S2>(
    f: (fst: F) => F2,
    g: (snd: S) => S2
  ): Tuple<F2, S2>
  'fantasy-land/map'<S2>(f: (snd: S) => S2): Tuple<F, S2>
  'fantasy-land/reduce'<T>(
    reducer: (accumulator: T, value: S) => T,
    initialValue: T
  ): T
  'fantasy-land/ap'<T, S2>(f: Tuple<T, (value: S) => S2>): Tuple<F, S2>
}

const TupleConstructor = <F, S>(fst: F, snd: S): Tuple<F, S> => ({
  constructor: Tuple,
  0: fst,
  1: snd,
  length: 2,
  *[Symbol.iterator]() {
    yield fst
    yield snd
  },
  toJSON(): [F, S] {
    return this.toArray()
  },
  inspect(): string {
    return `Tuple(${fst}, ${snd})`
  },
  toString(): string {
    return this.inspect()
  },
  fst(): F {
    return fst
  },
  snd(): S {
    return snd
  },
  equals(other: Tuple<F, S>): boolean {
    return fst === other.fst() && snd === other.snd()
  },
  bimap<F2, S2>(f: (fst: F) => F2, g: (snd: S) => S2): Tuple<F2, S2> {
    return Tuple(f(fst), g(snd))
  },
  mapFirst<F2>(f: (fst: F) => F2): Tuple<F2, S> {
    return Tuple(f(fst), snd)
  },
  map<S2>(f: (snd: S) => S2): Tuple<F, S2> {
    return Tuple(fst, f(snd))
  },
  reduce<T>(reducer: (accumulator: T, value: S) => T, initialValue: T): T {
    return reducer(initialValue, snd)
  },
  toArray(): [F, S] {
    return [fst, snd]
  },
  swap(): Tuple<S, F> {
    return Tuple(snd, fst)
  },
  ap<T, S2>(f: Tuple<T, (value: S) => S2>): Tuple<F, S2> {
    return Tuple(fst, f.snd()(snd))
  },

  'fantasy-land/equals'(other: Tuple<F, S>): boolean {
    return this.equals(other)
  },
  'fantasy-land/bimap'<F2, S2>(
    f: (fst: F) => F2,
    g: (snd: S) => S2
  ): Tuple<F2, S2> {
    return this.bimap(f, g)
  },
  'fantasy-land/map'<S2>(f: (snd: S) => S2): Tuple<F, S2> {
    return this.map(f)
  },
  'fantasy-land/reduce'<T>(
    reducer: (accumulator: T, value: S) => T,
    initialValue: T
  ): T {
    return this.reduce(reducer, initialValue)
  },
  'fantasy-land/ap'<T, S2>(f: Tuple<T, (value: S) => S2>): Tuple<F, S2> {
    return this.ap(f)
  }
})

export const Tuple: TupleTypeRef = Object.assign(TupleConstructor, {
  fromArray: <F, S>([fst, snd]: [F, S]): Tuple<F, S> => {
    return Tuple(fst, snd)
  },
  fanout: <F, S, T>(
    ...args: [(value: T) => F, ((value: T) => S)?, T?]
  ): any => {
    const [f, g, value] = args

    switch (args.length) {
      case 3:
        return Tuple(f(value!), g!(value!))
      case 2:
        return (value: T) => Tuple.fanout(f, g!, value)
      default:
        return <S>(g: (value: T) => S) => (value: T) =>
          Tuple.fanout(f, g, value)
    }
  }
})
