FROM java:8

ENV SYNTAXNETDIR=/opt/tensorflow PATH=$PATH:/root/bin

RUN mkdir -p $SYNTAXNETDIR \
    && cd $SYNTAXNETDIR \
    && apt-get update \
    && apt-get install git zlib1g-dev file swig python2.7 python-dev python-pip python-mock -y \
    && pip install --upgrade pip \
    && pip install -U protobuf==3.0.0 \
    && pip install asciitree \
    && pip install numpy \
    && wget https://github.com/bazelbuild/bazel/releases/download/0.3.1/bazel-0.3.1-installer-linux-x86_64.sh \
    && chmod +x bazel-0.3.1-installer-linux-x86_64.sh \
    && ./bazel-0.3.1-installer-linux-x86_64.sh --user \
    && git clone --recursive https://github.com/tensorflow/models.git \
    && cd $SYNTAXNETDIR/models/syntaxnet/tensorflow \
    && echo "\n\n\n\n" | ./configure \
    && apt-get autoremove -y \
    && apt-get clean

RUN cd $SYNTAXNETDIR/models/syntaxnet \
    && bazel test --genrule_strategy=standalone syntaxnet/... util/utf8/...

ADD requirements.txt /root/requirements.txt
ADD context.add.pbtxt /root/context.add.pbtxt
RUN pip install -r /root/requirements.txt \
    && cat /root/context.add.pbtxt >> \
      $SYNTAXNETDIR/models/syntaxnet/syntaxnet/models/parsey_mcparseface/context.pbtxt
ADD work.sh /root/work.sh
ADD server.py /root/server.py
EXPOSE 5005

WORKDIR $SYNTAXNETDIR/models/syntaxnet

CMD [ "python", "/root/server.py"]

# COMMANDS to build and run
# ===============================
# mkdir build && cp Dockerfile build/ && cd build
# docker build -t syntaxnet .
# docker run syntaxnet
