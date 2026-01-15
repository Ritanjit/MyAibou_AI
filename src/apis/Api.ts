import axios, { AxiosRequestConfig } from "axios";
import { Buffer } from "buffer";

export const _DATABASE = "<DB_NAME>";
export const _BASE_URL = "https://v5.frontql.dev";
const local_host = "http://localhost:4466";
import tokens from "./tokens.json";

interface Tokens {
	[key: string]: string;
}

const typedTokens: Tokens = tokens;

type HttpMethod = "get" | "post" | "put" | "delete" | "sql";

type RequestOptions = {
	loading?: boolean;
	body?: {
		sql: "string";
		params: [{ [key: string]: string | number }];
	};
	key?: Record<string, string | any>;
	page?: Record<string, string | number>;
	sort?: Record<string, string | number>;
	joins?: Record<string, string | number>;
	filter?: Record<string, string | number>;
	search?: Record<string, string | number>;
	nearby?: Record<string, string | number>;
	hidden?: Record<string, string | number>;
	fields?: Record<string, string | number>;
	session?: Record<string, string | number>;
	validation?: Record<string, string | number>;
	permissions?: Record<string, string | number>;
};

function uniqueKey(input: string) {
	let code = input.charCodeAt(0);
	for (let i = 0; i < input.length; i++) {
		const char = input.charCodeAt(i);
		code = (code << 5) - code + char;
		code &= code;
	}

	return Buffer.from(code.toString()).toString("base64").substring(0, 8);
}

function getKey(method: HttpMethod, url: string, options: RequestOptions) {
	const _url = local_host + url;
	const parsed_url = new URL(_url);
	// const pathname = parsed_url.pathname;
	const pathname = "/" + parsed_url.pathname.split("/")[1];

	const request: any = {
		fields: options?.fields,
		hidden: options?.hidden,
		filter: options?.filter,
		nearby: options?.nearby,
		collections: options?.joins,
		permissions: options?.permissions,
		validation: options?.validation,
	};

	request["body_is_array"] = Array.isArray(options.body || {});

	let tokenStr = pathname;
	for (const key in request) {
		if (request[key]) {
			tokenStr += key + ":" + request[key];
		}
	}
	const key = method + ":" + pathname + ">" + uniqueKey(tokenStr);
	return key;
}

const makeRequest = async (method: HttpMethod, endpoint: string, options: RequestOptions = {}): Promise<any> => {
	const {
		body,
		page,
		sort,
		joins,
		hidden,
		fields,
		filter,
		search,
		nearby,
		session,
		validation,
		permissions,
		loading = true,
	} = options;

	const headers: any = {};

	if (hidden) headers.hidden = hidden;
	if (filter) headers.filter = filter;
	if (fields) headers.fields = fields;
	if (session) headers.session = session;
	if (joins) headers.collections = joins;
	if (validation) headers.validation = validation;
	if (permissions) headers.permissions = permissions;
	if (nearby) headers.nearby = nearby;

	const key = getKey(method, endpoint, options);
	const token = typedTokens[key] || false;

	if (!token) {
		headers["key"] = key;
	} else {
		headers.token = token;
	}

	const params: any = {
		page: page,
		sort: sort,
		search: search,
	};

	try {
		if (loading) {
			// console.log("Loading started...");
		}

		const axiosInstance = axios.create({
			baseURL: token ? _BASE_URL : local_host,
			headers: { app: _DATABASE },
		});

		const requestConfig: AxiosRequestConfig = {
			method,
			params,
			headers,
			data: body,
			url: endpoint,
		};

		const response = await axiosInstance(requestConfig);
		return response.data;
	} catch (error: any) {
		console.error(`${method.toUpperCase()} Error:`, error.message);
		throw error;
	} finally {
		if (loading) {
			// console.log("Loading completed.");
		}
	}
};

const Api = {
	get: async (endpoint: string, options?: RequestOptions): Promise<any> => makeRequest("get", endpoint, options),
	put: async (endpoint: string, options?: RequestOptions): Promise<any> => makeRequest("put", endpoint, options),
	post: async (endpoint: string, options?: RequestOptions): Promise<any> => makeRequest("post", endpoint, options),
	delete: async (endpoint: string, options?: RequestOptions): Promise<any> => makeRequest("delete", endpoint, options),
	sql: async (endpoint: string, options?: RequestOptions): Promise<any> =>
		makeRequest("post", `/sql-${endpoint.replace("/", "")}`, options),
};

export default Api;
