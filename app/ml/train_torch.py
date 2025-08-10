import pandas as pd
from app.ml.features import make_features
from app.ml.datasets import WindowDataset, TCN
from app.ml.registry import save_model

DEVICE="cpu"

def _prep(df: pd.DataFrame):
    feats=make_features(df); y=(df["close"].shift(-1)>df["close"]).astype(int).fillna(0)
    feats,y=feats.iloc[50:], y.iloc[50:]; return feats,y

def _fit_once(X: pd.DataFrame, y, params: dict, win:int=64, epochs:int=12):
    import torch  # lazy
    ds=WindowDataset(X,y,win)
    if len(ds)<100: return 0.5, None
    loader=torch.utils.data.DataLoader(ds, batch_size=params["batch"], shuffle=False)
    model=TCN(n_feat=X.shape[1], hidden=params["hidden"]).to(DEVICE)
    opt=torch.optim.AdamW(model.parameters(), lr=params["lr"]); loss_fn=torch.nn.CrossEntropyLoss()
    for _ in range(epochs):
        model.train()
        for xb,yb in loader:
            xb=xb.to(DEVICE); yb=yb.to(DEVICE); opt.zero_grad()
            out=model(xb); loss=loss_fn(out,yb); loss.backward(); opt.step()
    import math; n=len(ds); s=math.floor(n*0.9); correct=total=0
    model.eval()
    with torch.no_grad():
        for i in range(s,n):
            xb,_y=ds[i]; xb=xb.unsqueeze(0).to(DEVICE)
            pred=torch.argmax(model(xb),dim=1).item()
            correct+=int(pred==_y.item()); total+=1
    return (correct/max(1,total)), model

def train_optuna(df: pd.DataFrame, n_trials:int=12, win:int=64):
    import optuna  # lazy
    X,y=_prep(df)
    def obj(trial):
        params={"hidden":trial.suggest_categorical("hidden",[16,32,64,96]),
                "lr":trial.suggest_float("lr",1e-4,3e-3,log=True),
                "batch":trial.suggest_categorical("batch",[32,64,128])}
        acc,_=_fit_once(X,y,params,win,epochs=8); return acc
    study=optuna.create_study(direction="maximize"); study.optimize(obj, n_trials=n_trials)
    best=study.best_params; acc,model=_fit_once(X,y,best,win,epochs=20)
    path=save_model(model.state_dict(), {"framework":"torch","acc":acc,"params":best,"win":win})
    return {"model_path":path,"acc":acc,"params":best}
