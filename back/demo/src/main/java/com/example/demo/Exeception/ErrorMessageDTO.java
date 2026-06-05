package com.example.demo.Exeception;


public class ErrorMessageDTO {
    
        private String message; // captura a mensagem
        private String field;// captura o campo

    public ErrorMessageDTO(String message, String field) {
        this.message = message;
        this.field = field;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }
}

