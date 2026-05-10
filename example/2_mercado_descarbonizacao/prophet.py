import pickle
import numpy as np
import pandas as pd


def forecast_prophet(
    df,
    h,
    model_path="prophet_best_model_cbio.pkl",
    floor_value=15
):
    """
    Realiza previsão utilizando um modelo Prophet salvo.

    Parâmetros
    ----------
    df : pandas.DataFrame
        Série pré-processada contendo:
        - ds : datas
        - y  : valores
        - cap: capacidade máxima utilizada no modelo logístico

    h : int
        Horizonte de previsão.

    model_path : str
        Caminho do modelo .pkl salvo.

    floor_value : float
        Valor mínimo (floor) do crescimento logístico.

    Retorno
    -------
    pandas.DataFrame
        DataFrame no formato:

        Data | Max | Min | Pred
    """
    # CARREGA MODELO
    with open(model_path, "rb") as f:
        loaded_model = pickle.load(f)
    # FUTURE DATAFRAME
    future = loaded_model.make_future_dataframe(
        periods=h,
        freq='D'
    )

    # Reaplica floor e cap
    future['floor'] = floor_value
    future['cap'] = df['cap'].max()
    # PREVISÃO
    forecast = loaded_model.predict(future)
    # REMOVE VALORES NEGATIVOS
    # max(0, x)
    forecast['yhat'] = np.maximum(0, forecast['yhat'])
    forecast['yhat_lower'] = np.maximum(0, forecast['yhat_lower'])
    forecast['yhat_upper'] = np.maximum(0, forecast['yhat_upper'])
    # APENAS FUTURO
    future_forecast = forecast.tail(h)[
        [
            'ds',
            'yhat_upper',
            'yhat_lower',
            'yhat'
        ]
    ].copy()
    # RENOMEIA COLUNAS
    future_forecast.columns = [
        'Data',
        'Max',
        'Min',
        'Pred'
    ]

    # Reset index
    future_forecast.reset_index(drop=True, inplace=True)

    return future_forecast