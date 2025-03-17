declare namespace jest {
    interface Matchers<R> {
        toBeSortedBy: (key: string, options?: { descending?: boolean }) => R;
    }
}
