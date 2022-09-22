
import torch
import pydantic

if torch.cuda.is_available():
    from .model_8bit import code_model
else:
    from .model_cpu import code_model


class Config(pydantic.BaseModel):
    if torch.cuda.is_available():
        name_or_path_to_model = 'Salesforce/codegen-6B-multi'
    else: 
        name_or_path_to_model = 'Salesforce/codegen-350M-multi'
    code = code_model
