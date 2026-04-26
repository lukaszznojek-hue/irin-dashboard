# Checkpoint v5 - Faza 0 (audyt + przygotowanie)

Data: 2026-04-27
Branch: refactor/v5-grupowanie-deep-link
Tag rollback: v4.0.0-pre-refactor-v5 (push OK)

## Wykonane

- [x] Tag v4.0.0-pre-refactor-v5 utworzony i pushed
- [x] Branch refactor/v5-grupowanie-deep-link utworzony i pushed
- [x] Walidacja JSON pre-v5: 39 plików OK (archiwum/validation_pre_v5.log)
- [x] Backup data/ do archiwum/data_backup_v4_20260427/
- [x] Audyt zapisany w archiwum/audit_v5.md
- [x] jsonschema 4.25.1 zainstalowany (Python user-site)
- [x] .gitignore rozszerzony o backup + pycache

## Kluczowe wnioski z audytu

- 357 powiatów, **334 z urgency=nieznany** → po migracji wszystkie staną się akcja_status=zadzwon (zgodnie z mapowaniem z instrukcji)
- 2 projekty BUR w 16 WUP (Świętokrzyskie 1) → reszta pusta, w Fazie A schemat rozszerzony, dane null + do_weryfikacji
- 9 usług IRIN (meta deklaruje 12 - dług, nie naprawiamy)
- dashboard.js: 534 linie, 23 funkcje render*/toggle*/apply*

## Następna faza

Faza A: backend dane (45-60 min) - schematy + migracja + walidator
