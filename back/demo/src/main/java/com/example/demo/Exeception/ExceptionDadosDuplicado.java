package com.example.demo.Exeception;

public class ExceptionDadosDuplicado extends RuntimeException{
    
    public ExceptionDadosDuplicado() {
        super("Esse Dado já existe");
    }

}
