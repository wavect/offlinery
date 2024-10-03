export interface FactoryInterface {}
export type TestFactory = "user" | "encounter";
export type FactoryPair = Map<TestFactory, FactoryInterface>;
