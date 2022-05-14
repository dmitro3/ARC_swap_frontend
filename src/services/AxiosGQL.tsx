import axios, { AxiosInstance } from 'axios';

/**
 * Wraps the gql queries to be executed using axios.
 *
 * This is an abstract class and should only be extended.
 *
 * @author [Pollum](pollum.io)
 * @since 0.2.0
 *
 */
abstract class AxiosGQL {
  api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
    });
  }

  /**
   * Executes a query.
   *
   * If the query returns an error in a successful request, it will throw an error.
   *
   * @param query
   * @returns
   */
  protected async executeQuery(query: string, path = ''): Promise<any> {
    const result = await this.api.post(path, {
      query,
    });
    if ('errors' in result.data) {
      throw new Error(result.data.error);
    }
    return result.data.data ?? result.data;
  }
}

export default AxiosGQL;
