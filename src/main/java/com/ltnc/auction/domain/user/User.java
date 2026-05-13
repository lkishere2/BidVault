    package com.ltnc.auction.domain.user;

    import java.math.BigDecimal;
    import java.util.Collection;
    import java.util.List;

    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;

    import jakarta.persistence.Column;
    import jakarta.persistence.Entity;
    import jakarta.persistence.EnumType;
    import jakarta.persistence.Enumerated;
    import jakarta.persistence.GeneratedValue;
    import jakarta.persistence.GenerationType;
    import jakarta.persistence.Id;
    import jakarta.persistence.Table;
    import lombok.Getter;
    import lombok.Setter;

    @Entity
    @Getter
    @Setter
    @Table(name = "users")
    public class User implements UserDetails{
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long userId;
        
        @Column(name = "username", nullable = false)
        private String username;

        @Column(name = "email", unique = true, nullable = false)
        private String email;

        @Column(name = "password", nullable = false)
        private String password;

        @Column(name = "balance", precision = 15, scale = 2)
        private BigDecimal balance;

        @Enumerated(EnumType.STRING)
        private Role role = Role.USER;

        @Override
        public String getUsername() {
            return this.email;
        }

        public String getDisplayUsername() {
            return this.username;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
        }
    }
