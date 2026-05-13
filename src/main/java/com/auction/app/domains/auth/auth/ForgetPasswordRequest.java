package com.auction.app.domains.auth.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgetPasswordRequest {
    private String email;
    private String verificationCode;
    private String newPassword;
}
