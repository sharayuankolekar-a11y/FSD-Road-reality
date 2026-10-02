const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
  Demo accounts for frontend development and project demonstration.

  Demo User:
  Email: user@roadreality.demo
  Password: User@123

  Demo Admin:
  Email: admin@roadreality.demo
  Password: Admin@123
*/

const demoAccounts = [
  {
    id: "demo-user-001",
    name: "Demo Commuter",
    email: "user@roadreality.demo",
    password: "User@123",
    role: "user",
    avatarUrl: null,
  },
  {
    id: "demo-admin-001",
    name: "Road Authority Admin",
    email: "admin@roadreality.demo",
    password: "Admin@123",
    role: "admin",
    avatarUrl: null,
  },
];

function wait(milliseconds = 700) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function saveSession(session) {
  localStorage.setItem("roadRealitySession", JSON.stringify(session));
}

export function getCurrentSession() {
  const savedSession = localStorage.getItem("roadRealitySession");

  if (!savedSession) {
    return null;
  }

  try {
    return JSON.parse(savedSession);
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem("roadRealitySession");
}

export async function loginUser({ email, password }) {
  /*
    ==========================================================
    REAL BACKEND VERSION — BACKEND DEPENDENCY: SUHAS
    ==========================================================

    When backend authentication is ready, remove the demo code
    below and use this API call.

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to sign in.");
    }

    return result;

    Expected response:

    {
      "data": {
        "user": {
          "id": "user-id",
          "name": "Sharayu",
          "email": "user@example.com",
          "role": "user",
          "avatarUrl": null
        }
      }
    }
  */

  if (API_BASE_URL) {
    throw new Error(
      "Backend authentication is not connected yet. Remove VITE_API_BASE_URL to use demo login."
    );
  }

  await wait();

  const account = demoAccounts.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password
  );

  if (!account) {
    throw new Error("Incorrect email or password. Please try again.");
  }

  const session = {
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      avatarUrl: account.avatarUrl,
    },
    accessToken: "demo-access-token",
  };

  saveSession(session);

  return {
    data: session,
  };
}

export async function signupUser({ name, email, password }) {
  /*
    ==========================================================
    REAL BACKEND VERSION — BACKEND DEPENDENCY: SUHAS
    ==========================================================

    When the backend is ready, use:

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to create account.");
    }

    return result;

    IMPORTANT:
    Do not send role: "admin" from the frontend signup form.
    The backend/database must always create public signups as role: "user".
  */

  if (API_BASE_URL) {
    throw new Error(
      "Backend signup is not connected yet. Remove VITE_API_BASE_URL to use demo signup."
    );
  }

  await wait();

  const demoEmailExists = demoAccounts.some(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (demoEmailExists) {
    throw new Error(
      "This email is already used by a demo account. Please use another email."
    );
  }

  /*
    Public signup always creates a normal user.

    Never create an admin from frontend form input.
  */
  const session = {
    user: {
      id: `demo-user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: "user",
      avatarUrl: null,
    },
    accessToken: "demo-access-token",
  };

  saveSession(session);

  return {
    data: session,
    message: "Account created successfully.",
  };
}