cd /opt/tensorflow/models/syntaxnet

bazel-bin/syntaxnet/parser_eval \
  --input inp_file \
  --output stdout-conll \
  --model syntaxnet/models/parsey_mcparseface/tagger-params \
  --task_context syntaxnet/models/parsey_mcparseface/context.pbtxt \
  --hidden_layer_sizes 64 \
  --arg_prefix brain_tagger \
  --graph_builder structured \
  --slim_model \
  --batch_size 1024 | bazel-bin/syntaxnet/parser_eval \
  --input stdout-conll  \
  --output out_file \
  --hidden_layer_sizes 512,512 \
  --arg_prefix brain_parser \
  --graph_builder structured \
  --task_context syntaxnet/models/parsey_mcparseface/context.pbtxt \
  --model_path syntaxnet/models/parsey_mcparseface/parser-params \
  --slim_model --batch_size 1024
