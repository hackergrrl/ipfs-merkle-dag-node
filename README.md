# ipfs-dag

> Create and use [IPFS](https://ipfs.io) [Merkle
> DAGs](https://github.com/jbenet/random-ideas/issues/20)!

## background

This code was originally based off of [vijayee's](https://github.com/vijayee)
[js-ipfs-merkle-dag](https://github.com/vijayee/js-ipfs-merkle-dag) module. To
contrast, this module offers the following key differences:

1. Only provides `DAG node` facilities; no assumptions are made re the existance
   of a `DAG Service`.
2. `Node` objects are immutable. This makes them much easier to use and reason
   about, since Merkle DAGs too are immutable.
3. The API provides only the bare necessities to create DAG nodes. More
   functionality can be added as needed, but odds are [you aren't gonna need
   it](http://c2.com/cgi/wiki?YouArentGonnaNeedIt).

## example

Let's build a DAG where `node2` points to `node1`, and `node3` points to the
other two:

```js
var dag = require('ipfs-dag')

// node data can be a string or a Buffer
var node1 = new dag.Node('hello')
console.log('Multihash', node1.multihash)
console.log('Data', node1.data)
console.log('Size', node1.size)
console.log('Links', node1.links)
console.log()

// link to other nodes by a list of Links..
var node2 = new dag.Node('world', [node1.asLink('prev')])
console.log('Multihash', node2.multihash)
console.log('Data', node2.data)
console.log('Size', node2.size)
console.log('Links', node2.links)
console.log()

// ..or link using an object that maps names->Nodes
var node3 = new dag.Node('!!!', { 'prev': node1, 'otherPrev': node2 })
console.log('Multihash', node3.multihash)
console.log('Data', node3.data)
console.log('Size', node3.size)
console.log('Links', node3.links)
console.log()
```

outputs

```
Multihash QmTnaGEpw4totXN7rhv2jPMXKfL8s65PhhCKL5pwtJfRxn
Data <Buffer 68 65 6c 6c 6f>
Size 7
Links []

Multihash QmRCETTRRkDQsZqxYgPv8QbCdcxoL8SccXo6YTa8t9UMM3
Data <Buffer 77 6f 72 6c 64>
Size 60
Links [ Link {
    name: 'prev',
    size: 7,
    hash: <Buffer 12 20 50 ee 82 31 ac 5b e6 b6 74 d3 5e 80 6d b2 90 0d d4 04 84 50 d2 9a 85 98 55 9a 9c 0d 08 8c c7 e3> } ]

Multihash Qmd6KYy2Rb2wuTHwUFTKg8QqRd1TqSEeD6GULjJuSCtDCA
Data <Buffer 21 21 21>
Size 169
Links [ Link {
    name: 'prev',
    size: 7,
    hash: <Buffer 12 20 50 ee 82 31 ac 5b e6 b6 74 d3 5e 80 6d b2 90 0d d4 04 84 50 d2 9a 85 98 55 9a 9c 0d 08 8c c7 e3> },
  Link {
    name: 'otherPrev',
    size: 60,
    hash: <Buffer 12 20 2a 6a fd e7 89 56 40 b9 09 8f 82 51 ff b0 59 d1 82 b0 88 87 23 ed 18 2b 11 2c fa 40 ba 29 0f 32> } ]
```

# api

```js
var dag = require('ipfs-dag')
```

### var node = new dag.Node(data, links=[])

Creates a new IPFS Merkle DAG node with `data` contents and links to other DAG
nodes `links`.

`data` can be either a `string` or a `Buffer`. The former will be converted into
the latter.

`links` can either be a list of Links or an object that maps link names
(strings) to nodes (Nodes):

Using a list: `var node2 = new dag.Node('foo', [node1.asLink('link-name')]`

Using an object: `var node2 = new dag.Node('foo', { 'link-name': node1 })`

If not provided, `links` will be considered an empty list.

### node

Nodes are immutable, and expose the following properties:

- `data` - a `Buffer` containing the data passed in when the node was created.
- `encoded` - a `Buffer` with the binary
  [protobuffer](https://developers.google.com/protocol-buffers/) encoding of the
  node.
- `hash` - a `Buffer` of the object after it has been SHA2-256 hashed.
- `size` - for convenience, the size of the `encoded` data, in bytes.
- `multihash` - for convenience, the base58-encoded string of `hash`.

#### node.asLink(name)

Creates a new immutable Link object with name `name` (a string) that points to
the node `node`.

Links have the following properties:

- `name` - the name of the link
- `size` - the size of the node the link points to, in bytes
- `hash` - a `Buffer` of the object after it has been SHA2-256 hashed.

### dag.fromProtobuf(data)

Creates a new DAG node from the binary protobuffer encoding of a node
(`encoded`, above).

## install

With [`npm`](http://npmjs.org/), run

```
npm install ipfs-dag
```

## license

MIT

## related

> [js-ipfs](https://github.com/ipfs/js-ipfs/) - IPFS implementation in
> JavaScript
