/*
 * Password Generator v2.1
 * Hanna Skairipa's Legacy Authentication System
 *
 * Compile: gcc -o pgen pgen.c
 * Usage: ./pgen <fragment1> <fragment2> <fragment3> <site> <mod>
 *
 * This generator uses a custom algorithm to create secure passwords
 * from distributed fragments and site-specific parameters.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void generate_password(const char *frag1, const char *frag2, const char *frag3,
                       const char *site, int mod) {
    char buffer[256];
    int i, shift;

    // Combine fragments with site-specific transformation
    snprintf(buffer, sizeof(buffer), "%s_%s_%s", frag1, frag2, frag3);

    // Apply site parameter (reverse if site contains 'shadow')
    if (strstr(site, "shadow") != NULL) {
        int len = strlen(buffer);
        for (i = 0; i < len / 2; i++) {
            char temp = buffer[i];
            buffer[i] = buffer[len - 1 - i];
            buffer[len - 1 - i] = temp;
        }
    }

    // Apply modular transformation
    shift = mod % 26;
    for (i = 0; buffer[i] != '\0'; i++) {
        if (buffer[i] >= 'a' && buffer[i] <= 'z') {
            buffer[i] = ((buffer[i] - 'a' + shift) % 26) + 'a';
        } else if (buffer[i] >= 'A' && buffer[i] <= 'Z') {
            buffer[i] = ((buffer[i] - 'A' + shift) % 26) + 'A';
        } else if (buffer[i] >= '0' && buffer[i] <= '9') {
            buffer[i] = ((buffer[i] - '0' + shift) % 10) + '0';
        }
    }

    // Final password format
    printf("%s\n", buffer);
}

int main(int argc, char *argv[]) {
    if (argc != 6) {
        fprintf(stderr, "Usage: %s <fragment1> <fragment2> <fragment3> <site> <mod>\n", argv[0]);
        fprintf(stderr, "\nExample:\n");
        fprintf(stderr, "  %s S3cur3 P4ssw0rd Fr4gm3nt shadow-assets 13\n", argv[0]);
        return 1;
    }

    const char *frag1 = argv[1];
    const char *frag2 = argv[2];
    const char *frag3 = argv[3];
    const char *site = argv[4];
    int mod = atoi(argv[5]);

    if (mod <= 0) {
        fprintf(stderr, "Error: mod parameter must be a positive integer\n");
        return 1;
    }

    generate_password(frag1, frag2, frag3, site, mod);

    return 0;
}
