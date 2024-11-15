import { describe, it, expect, Mock, vi } from "vitest";
import { FetchHttpClientAdapter } from "./FetchHttpClientAdapter";
import {
  HttpRequest,
  HttpResponse,
  // HttpClientProtocol,
} from "../../data/protocols/http/HttpClientProtocol";

const mockFetch = vi.fn();

globalThis.fetch = mockFetch as unknown as typeof fetch;

const makeSut = (): FetchHttpClientAdapter => {
  return new FetchHttpClientAdapter();
};

describe.only("FetchHttpClientAdapter", () => {
  const url = "http://test-url.com/resource";
  const body = { key: "value" };
  const headers = { "Content-Type": "application/json" };

  it("should call fetch with the correct parameters", async () => {
    const sut = makeSut();
    const request: HttpRequest = {
      url,
      method: "GET",
      body,
      headers,
    };

    (fetch as Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ result: "success" }),
    });

    await sut.request(request);

    expect(fetch).toHaveBeenCalledWith(url, {
      method: "GET",
      body: JSON.stringify(body),
      headers,
    });
  });

  it("should return the correct HttpResponse on success", async () => {
    const sut = makeSut();
    const request: HttpRequest = { url, method: "GET" };

    (fetch as Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ result: "success" }),
    });

    const response = await sut.request(request);

    expect(response).toEqual<HttpResponse>({
      statusCode: 200,
      body: { result: "success" },
    });
  });

  it.only("should handle fetch errors gracefully and return an empty body", async () => {
    const sut = makeSut();
    const request: HttpRequest = { url, method: "GET" };

    (fetch as Mock).mockRejectedValueOnce(new Error("Network error"));

    const response = await sut.request(request);

    expect(response).toEqual<HttpResponse>({
      statusCode: 500,
      body: {
        error: "Network error",
      },
    });
  });

  it("should return the correct HttpResponse on non-200 status code", async () => {
    const sut = makeSut();
    const request: HttpRequest = { url, method: "GET" };

    (fetch as Mock).mockResolvedValueOnce({
      status: 404,
      json: async () => ({ error: "Not found" }),
    });

    const response = await sut.request(request);

    expect(response).toEqual<HttpResponse>({
      statusCode: 404,
      body: { error: "Not found" },
    });
  });
});
