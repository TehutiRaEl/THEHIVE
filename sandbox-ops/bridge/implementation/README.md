# Bridge implementation — five layers

File-native engines:

- `CAPTURE.py` `COMPRESS.py` `STORE.py` `INJECT.py` `EVOLVE.py`
- `pipeline.py` — end-to-end CLI
- `test_pipeline.py` — pytest suite

```bash
python3 pipeline.py --platform hive
python3 -m pytest test_pipeline.py -v
```

Full sources also in session zip: TheCopy-ops-SOURCE-ONLY.zip
