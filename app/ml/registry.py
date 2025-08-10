from pathlib import Path; import joblib
REG_DIR=Path("/code/models"); REG_DIR.mkdir(parents=True, exist_ok=True)
def save_model(model, meta:dict)->str:
    from datetime import datetime
    p=REG_DIR/f"model_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.joblib"
    joblib.dump({"model":model,"meta":meta}, p); return str(p)
def load_latest():
    files=sorted(REG_DIR.glob("model_*.joblib"))
    return None if not files else __import__("joblib").load(files[-1])
