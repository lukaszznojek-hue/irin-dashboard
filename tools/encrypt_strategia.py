#!/usr/bin/env python3
"""Build-time encryption strategii zarządu - AES-256-CBC + PBKDF2."""
import sys, json, hashlib, secrets, string, base64
from pathlib import Path
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA1

DASH = Path(__file__).parent.parent
PLAIN = DASH / "_zrodla/strategia_plaintext.md"
OUT = DASH / "data/strategia_encrypted.json"
SALT = b"irin-dashboard-2026"


def gen_password(n=16):
    chars = string.ascii_letters + string.digits + "_-"
    return "".join(secrets.choice(chars) for _ in range(n))


def encrypt(plaintext: str, password: str) -> dict:
    key = PBKDF2(
        password, SALT, dkLen=32, count=100000, hmac_hash_module=SHA1
    )
    iv = secrets.token_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(plaintext.encode("utf-8"), 16))
    return {
        "algorithm": "AES-256-CBC",
        "iv": base64.b64encode(iv).decode(),
        "ciphertext": base64.b64encode(ct).decode(),
        "salt_string": SALT.decode(),
        "kdf": "PBKDF2-HMAC-SHA1",
        "kdf_iterations": 100000,
        "checksum_plain_sha256": hashlib.sha256(plaintext.encode()).hexdigest(),
    }


if __name__ == "__main__":
    if not PLAIN.exists():
        print(
            f"ERROR: {PLAIN} nie istnieje. Uruchom najpierw tools/extract_strategia_html.py",
            file=sys.stderr,
        )
        sys.exit(1)

    if len(sys.argv) > 1 and sys.argv[1] == "--gen-password":
        password = gen_password()
        print(f"Wygenerowane hasło: {password}", file=sys.stderr)
    elif len(sys.argv) > 1:
        password = sys.argv[1]
    else:
        print(
            "Użycie: python3 encrypt_strategia.py [--gen-password|<haslo>]",
            file=sys.stderr,
        )
        sys.exit(1)

    plaintext = PLAIN.read_text()
    result = encrypt(plaintext, password)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2))
    print(f"✓ Zaszyfrowano: {OUT}")
    print(f"HASLO: {password}")
