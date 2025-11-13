
export interface PageProps<T = {}> {
  params: { [key: string]: string | string[] | undefined } & T;
  searchParams: { [key: string]: string | string[] | undefined };
}
