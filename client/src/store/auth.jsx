import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLogged, setIsLogged] = useState(false);
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/user", {
                method: "GET",
                credentials: "include", // Enable cookies
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            if (res.status === 200) {
                setRole(data.role);
                setUser(data);
                setIsLogged(true);
            } else {
                setIsLogged(false);
                setRole(null);
                setUser(null);
            }
        } catch (err) {
            console.log("Error fetching user:", err);
            setIsLogged(false);
            setRole(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const loginUser = async () => {
        // After successful login, fetch user data
        await fetchUser();
    };

    const logoutUser = async () => {
        try {
            await fetch("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include", // Enable cookies
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } catch (err) {
            console.log("Error logging out:", err);
        } finally {
            setIsLogged(false);
            setRole(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isLogged, role, user, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};