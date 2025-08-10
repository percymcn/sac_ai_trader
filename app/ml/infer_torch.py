import pandas as pd
from app.ml.features import make_features
from app.ml.datasets import TCN
from app.ml.registry import load_latest

def predict_proba_torch(df: pd.DataFrame)->float:
    import torch  # lazy import
    pkg=load_latest()
    if not pkg or not isinstance(pkg.get("model"), dict): return 0.5
    state=pkg["model"]; meta=pkg.get("meta",{}); win=int(meta.get("win",64))
    feats=make_features(df).astype("float32")
    if len(feats)<win: return 0.5
    x=feats.tail(win).values.T
    model=TCN(n_feat=x.shape[0], hidden=meta.get("params",{}).get("hidden",32))
    model.load_state_dict(state, strict=False); model.eval()
    with torch.no_grad():
        prob=torch.softmax(model(torch.tensor(x).unsqueeze(0)), dim=1)[0,1].item()
    return float(prob)
