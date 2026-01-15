import Api from "@/apis/Api";

export async function authUser({ email, password }) {
	const res = await Api.post(`/auth-users`, {
		fields: `id,name,email,phone,role`,
		body: { email: email || "", password: password || "" },
	});
	return res;
}

export async function getUsers({ search = "", page = "1,1000", sort = "-created_at" }) {
	const response = await Api.get("/users", {
		search: search,
		page: page,
		sort: sort || "-created_at",
	});
	return response;
}

export async function saveUser({ body }) {
	const response = await Api.post("/users", {
		body: body,
	});
	return response;
}

export async function updateUser({ id, body }) {
	const response = await Api.put(`/users/${id}`, {
		body: body,
	});
	return response;
}
