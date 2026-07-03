// src/App.js
import React from 'react';

import { AuthProvider } from './context/AuthContext';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import Inicio from './pages/Inicio/Inicio';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import EsqueciSenha from './pages/EsquenceSenha/EsqueciSenha';
import Perfil from './pages/Perfil/Perfil';
import AreasDeEstudo from './pages/AreaEstudo/AreasDeEstudo';
import ApresentacaoAula from './pages/ApresentacaoAula/ApresentacaoAula'; 
import DashboardProf from './pages/DashboadProf/DashboadProf';
import DashboadAdmin from './pages/DashboadAdmin/DashboadAdmin';

function App() {
  return (
   <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha/>}/>

          <Route path="/aula" element={
            <ProtectedRoute>
              <ApresentacaoAula />
            </ProtectedRoute>
          } />
          
          <Route path="/areaEstudo" element={
              <AreasDeEstudo />
          } />

          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />

          <Route path="/dashboard_Professor" element={
            <ProtectedRoute>
              <DashboardProf />
            </ProtectedRoute>
          } />

           <Route path="/dashboard_admin" element={
            <ProtectedRoute>
              <DashboadAdmin />
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
  </AuthProvider>
  );
}
export default App;
