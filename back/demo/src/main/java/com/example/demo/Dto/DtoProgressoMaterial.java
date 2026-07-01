package com.example.demo.Dto;

public class DtoProgressoMaterial {
    private String email;
    private Long materialId;

    public DtoProgressoMaterial() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getMaterialId() {
        return materialId;
    }

    public void setMaterialId(Long materialId) {
        this.materialId = materialId;
    }
}