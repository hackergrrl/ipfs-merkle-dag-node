var test = require('tape')
var dag = require('../index')

test('create a node', function (t) {
  var dagN = new dag.Node(new Buffer('some data'))
  t.assert(Buffer.isBuffer(dagN.data), 'is a buffer')
  t.assert(dagN.data.length, 9)
  t.equal(dagN.size, 11)
  t.equal(dagN.size, dagN.encoded.length)
  t.equal(dagN.multihash, 'Qmd7xRhW5f29QuBFtqu3oSD27iVy35NRB91XFjmKFhtgMr')
  t.equal(dagN.links.length, 0)

  t.end()
})

test('node immutability', function (t) {
  var dagN = new dag.Node(new Buffer('some data'))

  dagN.data = 999
  t.notEqual(dagN.data, 999)
  dagN.encoded = 999
  t.notEqual(dagN.encoded, 999)
  dagN.hash = 999
  t.notEqual(dagN.hash, 999)
  dagN.size = 999
  t.notEqual(dagN.size, 999)
  dagN.multihash = 999
  t.notEqual(dagN.multihash, 999)

  t.end()
})

test('create an empty node', function (t) {
  var dagN = new dag.Node(new Buffer(0))
  t.assert(Buffer.isBuffer(dagN.data), 'is a buffer')
  t.equal(dagN.data.length, 0)
  t.equal(dagN.size, 0)
  t.end()
})

test('re-encode equivalency', function (t) {
  var dagN = new dag.Node('you\'re all right, kid.')

  var reencodedNode = dag.fromProtobuf(dagN.encoded)
  t.deepEqual(dagN.data, reencodedNode.data)
  t.deepEqual(dagN.encoded, reencodedNode.encoded)
  t.deepEqual(dagN.hash, reencodedNode.hash)
  t.deepEqual(dagN.size, reencodedNode.size)
  t.deepEqual(dagN.multihash, reencodedNode.multihash)
  t.end()
})

test('link immutability', function (t) {
  var node1 = new dag.Node('hello')

  var link = node1.asLink('prev')

  link.name = 999
  t.equal(link.name, 'prev')
  link.size = 999
  t.equal(link.size, 7)
  link.hash = 999
  t.deepEqual(link.hash, new Buffer('122050ee8231ac5be6b674d35e806db2900dd4048450d29a8598559a9c0d088cc7e3', 'hex'))

  t.end()
})

test('create nodes with links', function (t) {
  var node1 = new dag.Node('hello')
  t.equal(node1.multihash, 'QmTnaGEpw4totXN7rhv2jPMXKfL8s65PhhCKL5pwtJfRxn')
  t.deepEqual(node1.data, new Buffer('hello'))
  t.equal(node1.size, 7)
  t.deepEqual(node1.links, [])

  var node2 = new dag.Node('world', [node1.asLink('prev')])
  t.equal(node2.multihash, 'QmRCETTRRkDQsZqxYgPv8QbCdcxoL8SccXo6YTa8t9UMM3')
  t.deepEqual(node2.data, new Buffer('world'))
  t.equal(node2.size, 60)
  t.equal(node2.links.length, 1)
  var link = {
    name: 'prev',
    size: 7,
    hash: new Buffer('122050ee8231ac5be6b674d35e806db2900dd4048450d29a8598559a9c0d088cc7e3', 'hex')
  }
  t.deepEqual(node2.links[0], link)

  var node3 = new dag.Node('!!!', { 'prev': node1, 'otherPrev': node2 })
  t.equal(node3.multihash, 'Qmd6KYy2Rb2wuTHwUFTKg8QqRd1TqSEeD6GULjJuSCtDCA')
  t.deepEqual(node3.data, new Buffer('!!!'))
  t.equal(node3.size, 169)
  t.equal(node3.links.length, 2)
  var link1 = {
    name: 'prev',
    size: 7,
    hash: new Buffer('122050ee8231ac5be6b674d35e806db2900dd4048450d29a8598559a9c0d088cc7e3', 'hex')
  }
  var link2 = {
    name: 'otherPrev',
    size: 60,
    hash: new Buffer('12202a6afde7895640b9098f8251ffb059d182b0888723ed182b112cfa40ba290f32','hex')
  }
  t.deepEqual(node3.links[0], link1)
  t.deepEqual(node3.links[1], link2)

  t.end()
})
