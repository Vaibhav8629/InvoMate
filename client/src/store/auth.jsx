import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(null);

    const isLogged = !!token;

    const fetchUser = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/user", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            console.log(data.role);
            if (res.status === 200) {
                setRole(data.role); // ✅ get role from backend
            } else {
                logoutUser();
            }
        } catch (err) {
            console.log("Error fetching user:", err);
            logoutUser();
        }
    };

    useEffect(() => {
        if (token) fetchUser();
    }, [token]);

    const storeTokenInLS = (serverToken) => {
        setToken(serverToken);
        localStorage.setItem("token", serverToken);
    };

    const logoutUser = () => {
        setToken("");
        setRole(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ isLogged, token, role, storeTokenInLS, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};