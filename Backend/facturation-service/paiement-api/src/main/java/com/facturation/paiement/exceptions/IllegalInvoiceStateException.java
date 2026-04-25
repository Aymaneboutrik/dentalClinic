package com.facturation.paiement.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class IllegalInvoiceStateException extends RuntimeException {
    public IllegalInvoiceStateException(String message) {
        super(message);
    }
}
