
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

from .settings import NAME_OR_PATH_TO_MODEL
# T5-3b and T5-11B are supported!
# We need sharded weights otherwise we get CPU OOM errors
model_id = NAME_OR_PATH_TO_MODEL

tokenizer = AutoTokenizer.from_pretrained(model_id)
model_8bit = AutoModelForCausalLM.from_pretrained(
    model_id
)

model_8bit.get_memory_footprint()

max_new_tokens = 50

input_ids = tokenizer(
    "def palindrome(word):", return_tensors="pt"
).input_ids     

outputs = model_8bit.generate(input_ids, max_new_tokens=max_new_tokens)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
