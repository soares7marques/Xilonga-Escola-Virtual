import React from "react";
import { Navigate } from "react-router-dom";

// Função para checar autenticação (ajuste conforme sua lógica)
function isAuthenticated() {
  // Valida apenas a existência do Ticket
  return !!localStorage.getItem("Ticket");
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // Redireciona para login se não autenticado
    return <Navigate to="/login" replace />;
  }
  return children;
}