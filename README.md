# Flask Application that is deployed with CDK

This project deploys Salesforce's Codegen 6B model on EC2 with 1 core, using 8-bit opithmization.
The 16B model was supposed to be deployed, but it couldn't be deployed on 1 core, so 4 cores will slow down API response unprecedentedly. This is not something we can put up with.

### Links on Model
- For local testing:
https://huggingface.co/Salesforce/codegen-350M-multi
- For deploying on ec2 instance:
https://huggingface.co/Salesforce/codegen-6B-multi
(You need to get approve on using G4DN instance for AWS.)

### Useful links
Single machine model parallel best practices:
https://pytorch.org/tutorials/intermediate/model_parallel_tutorial.html

https://deepspeed.readthedocs.io/en/latest/zero3.html

8 bits optimization, reduces reduces the memory footprint by models:
https://huggingface.co/blog/hf-bitsandbytes-integration

Techniques for Training Large Neural Networks:
https://openai.com/blog/techniques-for-training-large-neural-networks/