pipeline {
    agent any  // 使用任意可用的Jenkins代理
    
    // 工具配置（需在Jenkins全局工具中提前配置NodeJS 16）
    tools {
        nodejs 'NodeJS_16'
    }
    
    // 环境变量定义
    environment {
        // 项目名称（自定义）
        PROJECT_NAME ='my-vue-node-app'
        // 前后端镜像名称
        FRONTEND_IMAGE = "${PROJECT_NAME}-frontend:latest"
        BACKEND_IMAGE = "${PROJECT_NAME}-backend:latest"
        // docker-compose配置文件路径
        COMPOSE_FILE = "${env.WORKSPACE}/docker-compose.yml"
    }
    
    stages {
        // 1. 拉取代码
        stage('拉取代码') {
            steps {
                script {
                    echo "从Git仓库拉取最新代码..."
                    checkout scm  // 自动关联当前配置的Git仓库
                    echo "代码拉取完成，当前目录: ${env.WORKSPACE}"
                    sh "ls -la"  // 显示目录结构，确认代码拉取成功
                }
            }
        }
        
        // 2. 前端项目构建
        stage('构建前端') {
            steps {
                script {
                    echo "开始构建前端Vue项目..."
                    dir('frontend') {  // 进入前端目录
                        // 检查前端依赖文件
                        sh "ls -la package.json"
                        
                        // 安装依赖（使用npm ci确保依赖版本一致）
                        echo "安装前端依赖..."
                        sh "npm ci"
                        
                        // 运行代码检查（可选）
                        echo "运行代码 lint..."
                        sh "npm run lint || true"  // 即使lint有警告也继续执行
                        
                        // 构建生产版本
                        echo "构建前端生产包..."
                        sh "npm run build"
                        
                        // 检查构建结果
                        echo "构建结果检查..."
                        sh "ls -la dist/"  // 确认dist目录生成
                    }
                    echo "前端构建完成"
                }
            }
        }
        
        // 3. 后端项目构建
        stage('构建后端') {
            steps {
                script {
                    echo "开始构建后端Node项目..."
                    dir('backend') {  // 进入后端目录
                        // 检查后端依赖文件
                        sh "ls -la package.json"
                        
                        // 安装依赖（生产环境不安装devDependencies）
                        echo "安装后端依赖..."
                        sh "npm ci --production"
                        
                        // 运行单元测试（可选）
                        echo "运行后端单元测试..."
                        sh "npm test || true"  // 即使测试失败也继续（根据需要调整）
                        
                        // 检查项目文件
                        sh "ls -la"  // 确认关键文件存在
                    }
                    echo "后端构建完成"
                }
            }
        }
        
        // 4. 构建Docker镜像
        stage('构建Docker镜像') {
            steps {
                script {
                    // 构建前端镜像
                    echo "构建前端Docker镜像: ${FRONTEND_IMAGE}"
                    dir('frontend') {
                        sh "docker build -t ${FRONTEND_IMAGE}. -f Dockerfile"
                    }
                    
                    // 构建后端镜像
                    echo "构建后端Docker镜像: ${BACKEND_IMAGE}"
                    dir('backend') {
                        sh "docker build -t ${BACKEND_IMAGE}. -f Dockerfile"
                    }
                    
                    // 确认镜像创建成功
                    echo "已构建的镜像列表:"
                    sh "docker images | grep ${PROJECT_NAME}"
                }
            }
        }
        
        // 5. 部署应用
        stage('部署应用') {
            steps {
                script {
                    // 检查docker-compose配置文件
                    echo "检查docker-compose配置文件: ${COMPOSE_FILE}"
                    sh "ls -la ${COMPOSE_FILE}"
                    
                    // 停止并移除现有容器
                    echo "停止并清理旧容器..."
                    sh "docker-compose -f ${COMPOSE_FILE} down || true"  // 即使没有旧容器也继续
                    
                    // 启动新容器
                    echo "启动新容器..."
                    sh "docker-compose -f ${COMPOSE_FILE} up -d"
                    
                    // 检查容器状态
                    echo "当前容器状态:"
                    sh "docker-compose -f ${COMPOSE_FILE} ps"
                    
                    // 查看服务日志（前10行）
                    echo "前端服务日志:"
                    sh "docker logs ${PROJECT_NAME}_frontend_1 --tail 10"
                    echo "后端服务日志:"
                    sh "docker logs ${PROJECT_NAME}_backend_1 --tail 10"
                }
            }
        }
        
        // 6. 健康检查
        stage('健康检查') {
            steps {
                script {
                    echo "检查前端服务是否可用..."
                    sh "curl -s --head --fail http://localhost:80 || (echo '前端服务不可用' && exit 1)"
                    
                    echo "检查后端服务是否可用..."
                    sh "curl -s --head --fail http://localhost:3000 || (echo '后端服务不可用' && exit 1)"
                    
                    echo "所有服务健康检查通过"
                }
            }
        }
    }
    
    // 构建后操作
    post {
        success {
            echo "🎉 构建部署成功！"
            echo "前端访问地址: http://${env.JENKINS_URL.split(':')[0]}:80"
            echo "后端API地址: http://${env.JENKINS_URL.split(':')[0]}:3000"
        }
        failure {
            echo "❌ 构建部署失败，请查看日志排查问题"
            // 可选：发送邮件通知
            // emailext to: 'your-email@example.com', subject: '构建失败', body: '详情请查看Jenkins日志'
        }
        always {
            // 清理工作空间（可选）
            // cleanWs()
        }
    }
}
