import { Response } from "node-fetch";

export default class AzureClientError extends Error {
  private static generateMessage(response: Response): string {
    const intro = "Unexpected response from Azure API:";
    const errorText = `'${response.status} - ${response.statusText}`;

    return [intro, errorText].join(" ");
  }

  public status: number;
  public statusText: string;

  constructor(response: Response) {
    super(AzureClientError.generateMessage(response));
    this.status = response.status;
    this.statusText = response.statusText;
  }
}
