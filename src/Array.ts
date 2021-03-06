import { HKT, URIS, URIS2, URIS3, Type, Type2, Type3 } from './HKT'
import { Endomorphism, Predicate, Refinement, identity, tuple, concat } from './function'
import { Option, fromNullable } from './Option'
import { Ord } from './Ord'
import { Alternative1 } from './Alternative'
import { Applicative, Applicative1, Applicative2, Applicative3, Applicative2C, Applicative3C } from './Applicative'
import { Either } from './Either'
import { Extend1 } from './Extend'
import { Foldable1 } from './Foldable'
import { Monad1 } from './Monad'
import { Monoid } from './Monoid'
import { Plus1 } from './Plus'
import { Traversable1 } from './Traversable'
import { Unfoldable1 } from './Unfoldable'
import { liftA2 } from './Apply'
import * as option from './Option'

// Adapted from https://github.com/purescript/purescript-arrays

declare global {
  interface Array<T> {
    _URI: URI
    _A: T
  }
}

declare module './HKT' {
  interface URI2HKT<A> {
    Array: Array<A>
  }
}

export const URI = 'Array'

export type URI = typeof URI

/** @function */
export const getMonoid = <A = never>(): Monoid<Array<A>> => {
  return {
    concat,
    empty: []
  }
}

const map = <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => {
  const l = fa.length
  const r = new Array(l)
  for (let i = 0; i < l; i++) {
    r[i] = f(fa[i])
  }
  return r
}

const of = <A>(a: A): Array<A> => {
  return [a]
}

const ap = <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> => {
  return flatten(map(fab, f => map(fa, f)))
}

const chain = <A, B>(fa: Array<A>, f: (a: A) => Array<B>): Array<B> => {
  let resLen = 0
  const l = fa.length
  const temp = new Array(l)
  for (let i = 0; i < l; i++) {
    const e = fa[i]
    const arr = f(e)
    resLen += arr.length
    temp[i] = arr
  }
  const r = Array(resLen)
  let start = 0
  for (let i = 0; i < l; i++) {
    const arr = temp[i]
    const l = arr.length
    for (let j = 0; j < l; j++) {
      r[j + start] = arr[j]
    }
    start += l
  }
  return r
}

const reduce = <A, B>(fa: Array<A>, b: B, f: (b: B, a: A) => B): B => {
  const l = fa.length
  let r = b
  for (let i = 0; i < l; i++) {
    r = f(r, fa[i])
  }
  return r
}

export function traverse<F extends URIS3>(
  F: Applicative3<F>
): <U, L, A, B>(ta: Array<A>, f: (a: A) => Type3<F, U, L, B>) => Type3<F, U, L, Array<B>>
export function traverse<F extends URIS3, U, L>(
  F: Applicative3C<F, U, L>
): <A, B>(ta: Array<A>, f: (a: A) => Type3<F, U, L, B>) => Type3<F, U, L, Array<B>>
export function traverse<F extends URIS2>(
  F: Applicative2<F>
): <L, A, B>(ta: Array<A>, f: (a: A) => Type2<F, L, B>) => Type2<F, L, Array<B>>
export function traverse<F extends URIS2, L>(
  F: Applicative2C<F, L>
): <A, B>(ta: Array<A>, f: (a: A) => Type2<F, L, B>) => Type2<F, L, Array<B>>
export function traverse<F extends URIS>(
  F: Applicative1<F>
): <A, B>(ta: Array<A>, f: (a: A) => Type<F, B>) => Type<F, Array<B>>
export function traverse<F>(F: Applicative<F>): <A, B>(ta: Array<A>, f: (a: A) => HKT<F, B>) => HKT<F, Array<B>>
export function traverse<F>(F: Applicative<F>): <A, B>(ta: Array<A>, f: (a: A) => HKT<F, B>) => HKT<F, Array<B>> {
  const liftedSnoc: <A>(fa: HKT<F, Array<A>>) => (fb: HKT<F, A>) => HKT<F, Array<A>> = liftA2(F)(as => a => snoc(as, a))
  return (ta, f) => reduce(ta, F.of(zero()), (fab, a) => liftedSnoc(fab)(f(a)))
}

const zero = <A>(): Array<A> => []

const alt = concat

const unfoldr = <A, B>(b: B, f: (b: B) => Option<[A, B]>): Array<A> => {
  const ret: Array<A> = []
  let bb = b
  while (true) {
    const mt = f(bb)
    if (mt.isSome()) {
      const [a, b] = mt.value
      ret.push(a)
      bb = b
    } else {
      break
    }
  }
  return ret
}

const extend = <A, B>(fa: Array<A>, f: (fa: Array<A>) => B): Array<B> => {
  return fa.map((_, i, as) => f(as.slice(i)))
}

/** @function */
export const partitionMap = <A, L, R>(fa: Array<A>, f: (a: A) => Either<L, R>): { left: Array<L>; right: Array<R> } => {
  const left: Array<L> = []
  const right: Array<R> = []
  const len = fa.length
  for (let i = 0; i < len; i++) {
    f(fa[i]).fold(l => left.push(l), r => right.push(r))
  }
  return { left, right }
}

/**
 * Example
 *
 * ```ts
 * flatten([[1], [2], [3]]) // [1, 2, 3]
 * ```
 *
 * @function
 */
export const flatten = <A>(ffa: Array<Array<A>>): Array<A> => {
  let rLen = 0
  const len = ffa.length
  for (let i = 0; i < len; i++) {
    rLen += ffa[i].length
  }
  const r = Array(rLen)
  let start = 0
  for (let i = 0; i < len; i++) {
    const arr = ffa[i]
    const l = arr.length
    for (let j = 0; j < l; j++) {
      r[j + start] = arr[j]
    }
    start += l
  }
  return r
}

/**
 * Break an array into its first element and remaining elements
 * @function
 */
export const fold = <A, B>(as: Array<A>, b: B, cons: (head: A, tail: Array<A>) => B): B => {
  return isEmpty(as) ? b : cons(as[0], as.slice(1))
}

/**
 * Lazy version of `fold`
 * @function
 */
export const foldL = <A, B>(as: Array<A>, nil: () => B, cons: (head: A, tail: Array<A>) => B): B => {
  return isEmpty(as) ? nil() : cons(as[0], as.slice(1))
}

/**
 * Same as `reduce` but it carries over the intermediate steps
 *
 * ```ts
 * scanLeft([1, 2, 3], 10, (b, a) => b - a) // [ 10, 9, 7, 4 ]
 * ```
 *
 * @function
 */
export const scanLeft = <A, B>(as: Array<A>, b: B, f: ((b: B, a: A) => B)): Array<B> => {
  const l = as.length
  const r: Array<B> = new Array(l + 1)
  r[0] = b
  for (let i = 0; i < l; i++) {
    r[i + 1] = f(r[i], as[i])
  }
  return r
}

/**
 * Fold an array from the right, keeping all intermediate results
 * instead of only the final result
 *
 * ```ts
 * scanRight([1, 2, 3], 10, (a, b) => b - a) // [ 4, 5, 7, 10 ]
 * ```
 *
 * @function
 */
export const scanRight = <A, B>(as: Array<A>, b: B, f: (a: A, b: B) => B): Array<B> => {
  const l = as.length
  const r: Array<B> = new Array(l + 1)
  r[l] = b
  for (let i = l - 1; i >= 0; i--) {
    r[i] = f(as[i], r[i + 1])
  }
  return r
}

/**
 * Test whether an array is empty
 * @function
 */
export const isEmpty = <A>(as: Array<A>): boolean => {
  return as.length === 0
}

/**
 * Test whether an array contains a particular index
 * @function
 */
export const isOutOfBound = <A>(i: number, as: Array<A>): boolean => {
  return i < 0 || i >= as.length
}

/**
 * This function provides a safe way to read a value at a particular index from an array
 * @function
 */
export const index = <A>(i: number, as: Array<A>): Option<A> => {
  return isOutOfBound(i, as) ? option.none : option.some(as[i])
}

/**
 * Attaches an element to the front of an array, creating a new array
 */
export const cons = <A>(a: A, as: Array<A>): Array<A> => {
  const len = as.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i + 1] = as[i]
  }
  r[0] = a
  return r
}

/**
 * Append an element to the end of an array, creating a new array
 * @function
 */
export const snoc = <A>(as: Array<A>, a: A): Array<A> => {
  const len = as.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = as[i]
  }
  r[len] = a
  return r
}

/**
 * Get the first element in an array, or `None` if the array is empty
 * @function
 */
export const head = <A>(as: Array<A>): Option<A> => {
  return isEmpty(as) ? option.none : option.some(as[0])
}

/**
 * Get the last element in an array, or `None` if the array is empty
 * @function
 */
export const last = <A>(as: Array<A>): Option<A> => {
  return index(as.length - 1, as)
}

/**
 * Get all but the first element of an array, creating a new array, or `None` if the array is empty
 * @function
 */
export const tail = <A>(as: Array<A>): Option<Array<A>> => {
  return isEmpty(as) ? option.none : option.some(as.slice(1))
}

/**
 * Get all but the last element of an array, creating a new array, or `None` if the array is empty
 * @function
 */
export const init = <A>(as: Array<A>): Option<Array<A>> => {
  const len = as.length
  return len === 0 ? option.none : option.some(as.slice(0, len - 1))
}

/**
 * Keep only a number of elements from the start of an array, creating a new array
 * @function
 */
export const take = <A>(n: number, as: Array<A>): Array<A> => {
  return as.slice(0, n)
}

const spanIndexUncurry = <A>(as: Array<A>, predicate: Predicate<A>): number => {
  const l = as.length
  let i = 0
  for (; i < l; i++) {
    if (!predicate(as[i])) {
      break
    }
  }
  return i
}

/**
 * Split an array into two parts:
 * 1. the longest initial subarray for which all elements satisfy the specified predicate
 * 2. the remaining elements
 * @function
 */
export const span = <A>(as: Array<A>, predicate: Predicate<A>): { init: Array<A>; rest: Array<A> } => {
  const i = spanIndexUncurry(as, predicate)
  const init = Array(i)
  for (let j = 0; j < i; j++) {
    init[j] = as[j]
  }
  const l = as.length
  const rest = Array(l - i)
  for (let j = i; j < l; j++) {
    rest[j - i] = as[j]
  }
  return { init, rest }
}

/**
 * Calculate the longest initial subarray for which all element satisfy the
 * specified predicate, creating a new array
 * @function
 */
export const takeWhile = <A>(as: Array<A>, predicate: Predicate<A>): Array<A> => {
  const i = spanIndexUncurry(as, predicate)
  const init = Array(i)
  for (let j = 0; j < i; j++) {
    init[j] = as[j]
  }
  return init
}

/**
 * Drop a number of elements from the start of an array, creating a new array
 * @function
 */
export const drop = <A>(n: number, as: Array<A>): Array<A> => {
  return as.slice(n, as.length)
}

/**
 * Remove the longest initial subarray for which all element satisfy the
 * specified predicate, creating a new array
 * @function
 */
export const dropWhile = <A>(as: Array<A>, predicate: Predicate<A>): Array<A> => {
  const i = spanIndexUncurry(as, predicate)
  const l = as.length
  const rest = Array(l - i)
  for (let j = i; j < l; j++) {
    rest[j - i] = as[j]
  }
  return rest
}

/**
 * Find the first index for which a predicate holds
 * @function
 */
export const findIndex = <A>(as: Array<A>, predicate: Predicate<A>): Option<number> => {
  const len = as.length
  for (let i = 0; i < len; i++) {
    if (predicate(as[i])) {
      return option.some(i)
    }
  }
  return option.none
}

/**
 * Find the first element which satisfies a predicate function
 * @function
 */
export const findFirst = <A>(as: Array<A>, predicate: Predicate<A>): Option<A> => {
  return fromNullable(as.find(predicate))
}

/**
 * Find the last element which satisfies a predicate function
 * @function
 */
export const findLast = <A>(as: Array<A>, predicate: Predicate<A>): Option<A> => {
  const len = as.length
  let a: A | null = null
  for (let i = len - 1; i >= 0; i--) {
    if (predicate(as[i])) {
      a = as[i]
      break
    }
  }
  return fromNullable(a)
}

/**
 * Filter an array, keeping the elements which satisfy a predicate function, creating a new array
 * @function
 */
export const filter = <A>(as: Array<A>, predicate: Predicate<A>): Array<A> => {
  const l = as.length
  const r = []
  for (let i = 0; i < l; i++) {
    const v = as[i]
    if (predicate(v)) {
      r.push(v)
    }
  }
  return r
}

/** @function */
export const refine = <A, B extends A>(as: Array<A>, refinement: Refinement<A, B>): Array<B> => {
  return filter(as, refinement) as Array<B>
}

/** @function */
export const copy = <A>(as: Array<A>): Array<A> => {
  const l = as.length
  const r = Array(l)
  for (let i = 0; i < l; i++) {
    r[i] = as[i]
  }
  return r
}

/** @function */
export const unsafeInsertAt = <A>(i: number, a: A, as: Array<A>): Array<A> => {
  const xs = copy(as)
  xs.splice(i, 0, a)
  return xs
}

/**
 * Insert an element at the specified index, creating a new array, or
 * returning `None` if the index is out of bounds
 * @function
 */
export const insertAt = <A>(i: number, a: A, as: Array<A>): Option<Array<A>> => {
  return i < 0 || i > as.length ? option.none : option.some(unsafeInsertAt(i, a, as))
}

/** @function */
export const unsafeUpdateAt = <A>(i: number, a: A, as: Array<A>): Array<A> => {
  const xs = copy(as)
  xs[i] = a
  return xs
}

/**
 * Change the element at the specified index, creating a new array, or
 * returning `None` if the index is out of bounds
 * @function
 */
export const updateAt = <A>(i: number, a: A, as: Array<A>): Option<Array<A>> => {
  return isOutOfBound(i, as) ? option.none : option.some(unsafeUpdateAt(i, a, as))
}

/** @function */
export const unsafeDeleteAt = <A>(i: number, as: Array<A>): Array<A> => {
  const xs = copy(as)
  xs.splice(i, 1)
  return xs
}

/**
 * Delete the element at the specified index, creating a new array, or
 * returning `None` if the index is out of bounds
 * @function
 */
export const deleteAt = <A>(i: number, as: Array<A>): Option<Array<A>> => {
  return isOutOfBound(i, as) ? option.none : option.some(unsafeDeleteAt(i, as))
}

/**
 * Apply a function to the element at the specified index, creating a new
 * array, or returning `None` if the index is out of bounds
 * @function
 */
export const modifyAt = <A>(as: Array<A>, i: number, f: Endomorphism<A>): Option<Array<A>> => {
  return isOutOfBound(i, as) ? option.none : updateAt(i, f(as[i]), as)
}

/**
 * Reverse an array, creating a new array
 * @function
 */
export const reverse = <A>(as: Array<A>): Array<A> => {
  return copy(as).reverse()
}

/**
 * Apply a function to each element in an array, keeping only the results
 * which contain a value, creating a new array
 * @function
 */
export const mapOption = <A, B>(as: Array<A>, f: (a: A) => Option<B>): Array<B> => {
  return chain(as, a => f(a).fold([], of))
}

/**
 * Filter an array of optional values, keeping only the elements which contain
 * a value, creating a new array
 * @function
 */
export const catOptions = <A>(as: Array<Option<A>>): Array<A> => {
  return mapOption(as, identity)
}

/**
 * Extracts from a list of `Either` all the `Right` elements. All the `Right` elements are extracted in order
 * @function
 */
export const rights = <L, A>(as: Array<Either<L, A>>): Array<A> => {
  return chain(as, a => a.fold(() => [], of))
}

/**
 * Extracts from a list of `Either` all the `Left` elements. All the `Left` elements are extracted in order
 * @function
 */
export const lefts = <L, A>(as: Array<Either<L, A>>): Array<L> => {
  return chain(as, a => a.fold(of, () => []))
}

/**
 * Sort the elements of an array in increasing order, creating a new array
 * @function
 */
export const sort = <A>(ord: Ord<A>): ((as: Array<A>) => Array<A>) => {
  return as => copy(as).sort(ord.compare)
}

/**
 * Apply a function to pairs of elements at the same index in two arrays,
 * collecting the results in a new array.
 * If one input array is short, excess elements of the longer array are discarded.
 * @function
 */
export const zipWith = <A, B, C>(fa: Array<A>, fb: Array<B>, f: (a: A, b: B) => C): Array<C> => {
  const fc = []
  const len = Math.min(fa.length, fb.length)
  for (let i = 0; i < len; i++) {
    fc[i] = f(fa[i], fb[i])
  }
  return fc
}

/**
 * Takes two arrays and returns an array of corresponding pairs.
 * If one input array is short, excess elements of the longer array are discarded
 * @function
 */
export const zip = <A, B>(fa: Array<A>, fb: Array<B>): Array<[A, B]> => {
  return zipWith(fa, fb, tuple)
}

/**
 * Rotate an array to the right by `n` steps
 * @function
 */
export const rotate = <A>(n: number, xs: Array<A>): Array<A> => {
  const len = xs.length
  if (n === 0 || len <= 1 || len === Math.abs(n)) {
    return xs
  } else if (n < 0) {
    return rotate(len + n, xs)
  } else {
    return xs.slice(-n).concat(xs.slice(0, len - n))
  }
}

export const array: Monad1<URI> &
  Foldable1<URI> &
  Unfoldable1<URI> &
  Traversable1<URI> &
  Alternative1<URI> &
  Plus1<URI> &
  Extend1<URI> = {
  URI,
  map,
  of,
  ap,
  chain,
  reduce,
  unfoldr,
  traverse,
  zero,
  alt,
  extend
}
