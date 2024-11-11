interface treeNodeItf {
  [key: string]: any
  id: number
  name: string
}
interface treeItemItf {
  [key: string]: any
  parentId: number
  data: treeNodeItf
  status?: string
  children?: treeItemItf[]
}

// Функция обхода дерева tree с вызовом callback(item) для каждого элемента дерева
// Элемент дерева должен иметь поле tree со своим поддеревом
function treeTraversal(tree: any[], callback: any): treeItemItf | undefined {
  var memory: treeItemItf[] = []
  // в начале память содержит ссылки на корневые элементы
  tree.forEach((item) => memory.push(item))
  let curItem: treeItemItf | undefined // текущий элемент

  // закончить цикл, если не получается извлечь элемент из памяти
  while (memory.length) {
    curItem = memory.pop()
    if (callback(curItem)) {
      return curItem
    }
    if (curItem && curItem.children) {
      // помещаем дочерние элементы в память
      for (let i = 0; i < curItem.children.length; i++) {
        memory.push(curItem.children[i])
      }
    }
  }
  return undefined
}

// Функция обхода дерева, аналогичная treeTraversal,
// с передачей доп. атрибутов в callback(item, level, parent), где:
// level - уровень элемента в дереве (верхний - 0)
// parent - предок элемента
function treeTraversalExt(tree: any[], callback: any): treeItemItf | undefined {
  var memory: any[] = []
  // в начале память содержит ссылки на корневые элементы
  tree.forEach((_item) => memory.push({ item: _item, level: 0, parent: null }))
  let curItem: any // текущий элемент

  // закончить цикл, если не получается извлечь элемент из памяти
  while (memory.length) {
    curItem = memory.pop()
    if (callback(curItem.item, curItem.level, curItem.parent)) {
      return curItem.item
    }
    if (curItem.item.children) {
      // помещаем дочерние элементы в память
      for (let i = 0; i < curItem.item.children.length; i++) {
        memory.push({ item: curItem.item.children[i], level: curItem.level + 1, parent: curItem.item })
      }
    }
  }
  return undefined
}

// Функция обхода предков элементов дерева, где в элементе хранится Id предка в поле parentId
function parentsTraversal(_tree: any[], item: treeItemItf, callback: any): treeItemItf | undefined {
  let _parentId: number = item.parentId

  while (_parentId > 0) {
    const _parent = getTreeItem(_tree, _parentId)
    if (_parent != null) {
      if (callback(_parent)) {
        return _parent
      }
      _parentId = _parent.parentId
    }
  }
  return undefined
}

// Возвращает элемент дерева по id
function getTreeItem(_tree: any[], id: number): treeItemItf | undefined {
  return treeTraversal(_tree, (item: treeItemItf) => {
    return item.id === id
  })
}

// Возвращает элемент дерева по name
function getTreeItemForName(_tree: any[], name: string): treeItemItf | undefined {
  return treeTraversal(_tree, (item: treeItemItf) => {
    return item.data.name === name
  })
}

export { treeTraversal, treeTraversalExt, parentsTraversal, getTreeItem, getTreeItemForName }
