function *foo() {
    var x = 1 + (yield "foo");
    console.log(x);
}
