import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({children}) => {
    //get token 
    const { token } = useAuth();
    //check if token exist
    if(!token){
        return <Navigate to="/login"/>
    }
    return children;
}
