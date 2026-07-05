// Type override: @hookform/resolvers@5.4.0 doesn't support Zod 4 types natively
// Runtime is fine (Zod 4 has safeParse()), types need loosening.
declare module "@hookform/resolvers/zod" {
  export function zodResolver(schema: any, schemaOptions?: any, resolverOptions?: any): any;
}
